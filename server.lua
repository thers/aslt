local maxTargets = 2

local timeForStart = 10000
local timeForTarget = 10000
local timeForIntermission = 10000

function onNet(name, cb)
    RegisterServerEvent(name)
    AddEventHandler(name, cb)
end

function emitSync(to, transition)
    TriggerClientEvent('aslt:sync', to, round, transition)
end

function endOfRound()
    return round.target >= maxTargets
end

local transition = {
    None = 0,
    IdleToStarting = 1,
    StartingToRunning = 2,
    RunningToIntermission = 3,
    IntermissionToRunning = 4,
    RunningToIdle = 5
}

local round = {
    seed = 0,
    state = 'idle', -- idle, starting, running, intermission
    score = {}, -- key is a target index, value is an array where index is a team and value is a score at target
    target = 1,
    playersAtTarget = {},
    timerOfStart = timeForStart,
    timerOfTarget = timeForTarget,
    timerOfIntermission = timeForIntermission
}

onNet('aslt:start', function(seed)
    round = {
        seed = seed,
        state = 'starting',
        target = 1,
        score = {},
        playersTeams = {},
        playersAtTarget = {},
        timerOfStart = timeForStart,
        timerOfTarget = timeForTarget,
        timerOfIntermission = timeForIntermission
    }

    emitSync(-1, transition.None)
end)

onNet('aslt:sync', function()
    emitSync(source, transition.None)
end)

-- Low overhead separate events for potentially spammy things
onNet('aslt:on-target', function()
    round.playersAtTarget[source] = true

    TriggerClientEvent('aslt:on-target', -1, source)
end)
onNet('aslt:off-target', function()
    round.playersAtTarget[source] = false

    TriggerClientEvent('aslt:off-target', -1, source)
end)

local lastTime = 0
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)

        local currentTime = GetGameTimer()
        local dt = currentTime - lastTime
        local currentTransition = transitionNone
        local newTarget = false

        if round.state == 'starting' then
            round.timerOfStart = round.timerOfStart - dt

            if round.timerOfStart <= 0 then
                newTarget = true
                round.state = 'running'
                currentTransition = transition.StartingToRunning
            end
        elseif round.state == 'running' then
            local teamsMembersOnTarget = {}
            local playersOnTarget = 0

            local leadingTeam = 0
            local leadingTeamMembersOnTarget = 0
            local secondTeamMembersOnTarget = 0

            for playerId, onTarget in ipairs(round.playersAtTarget) do
                local playerTeam = round.playersTeams[playerId]

                if onTarget then
                    playersOnTarget = playersOnTarget + 1

                    if teamsMembersOnTarget[playerTeam] then
                        teamsMembersOnTarget[playerTeam] = teamsMembersOnTarget[playerTeam] + 1
                    else
                        teamsMembersOnTarget[playerTeam] = 1
                    end

                    if teamsMembersOnTarget[playerTeam] > leadingTeamMembersOnTarget then
                        if leadingTeam ~= playerTeam then
                            leadingTeam = playerTeam
                            secondTeamMembersOnTarget = leadingTeamMembersOnTarget
                        end

                        leadingTeamMembersOnTarget = teamsMembersOnTarget[playerTeam]
                    end
                end
            end

            local contesting = secondTeamMembersOnTarget == leadingTeamMembersOnTarget

            if playersOnTarget > 0 and not contesting then
                round.timerOfTarget = round.timerOfTarget - dt

                if round.timerOfTarget <= 0 then
                    if endOfRound() then
                        round.state = 'idle'
                        currentTransition = transition.RunningToIdle
                    else
                        round.state = 'intermission'
                        round.timerOfIntermission = timeForIntermission
                        currentTransition = transition.RunningToIntermission
                    end

                    local leadingTeamScore = round.score[round.target][leadingTeam]
                    round.score[round.target][leadingTeam] = leadingTeamScore + 1
                end
            end
        elseif round.state == 'intermission' then
            round.timerOfIntermission = round.timerOfIntermission - dt

            if round.timerOfIntermission <= 0 then
                newTarget = true
                round.state = 'running'
                currentTransition = transition.IntermissionToRunning
                round.target = round.target + 1
            end
        end

        if targetCreationPending then
            round.timerOfTarget = timeForTarget
            round.playersAtTarget = {}
        end

        if currentTransition ~= transition.None then
            emitSync(-1, currentTransition)
        end

        lastTime = currentTime
    end
end)
