local maxTargets = 2

local timeForStart = 5000
local timeForTarget = 10000
local timeForIntermission = 10000

local transition = {
    Initial = 1337,
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
    playersTeams = {},
    playersAtTarget = {},
    timerOfStart = timeForStart,
    timerOfTarget = timeForTarget,
    timerOfIntermission = timeForIntermission
}

-- Map of players randoms so we can assign them to teams
local booking = {}

-- Map of players steam id's to their current ids
local playersMigrationTable = {}

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

function sourceSteamdId()
    return GetPlayerIdentifier(source, 0)
end

onNet('plr', function()
    Citizen.Trace('Player steamid: ' .. sourceSteamdId() .. ', id ' .. source .. '\n')
end)

onNet('aslt:start', function(seed)
    round = {
        seed = seed,
        state = 'starting',
        target = 1,
        score = {0, 0},
        playersTeams = {},
        playersAtTarget = {},
        timeForStart = timeForStart,
        timerOfStart = timeForStart,
        timeForTarget = timeForTarget,
        timerOfTarget = timeForTarget,
        timeForIntermission = timeForIntermission,
        timerOfIntermission = timeForIntermission
    }
    booking = {}
    playersMigrationTable = {}

    emitSync(-1, transition.IdleToStarting)
end)

onNet('aslt:book', function(rnd)
    booking[source] = rnd
    playersMigrationTable[sourceSteamdId()] = source
end)

-- Request for initial sync
onNet('aslt:sync', function()
    -- Lets see if player just reconnected so we can migrate it's data
    if round.state ~= 'idle' then
        local playerSteamId = sourceSteamdId()

        if playersMigrationTable[playerSteamId] then
            local oldPlayerId = playersMigrationTable[playerSteamId]
            local newPlayerId = source

            Citizen.Trace('Migrating player ' .. playerSteamId .. ', was ' .. oldPlayerId .. ', now ' .. newPlayerId .. '\n')

            round.playersTeams[newPlayerId] = round.playersTeams[oldPlayerId]
            round.playersTeams[oldPlayerId] = nil

            round.playersAtTarget[oldPlayerId] = nil
            round.playersAtTarget[newPlayerId] = false

            playersMigrationTable[playerSteamId] = newPlayerId
        end
    end

    emitSync(source, transition.Initial)
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

local syncThreshold = 1000

local lastTime = 0
local sinceLastSync = 9000
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)

        local currentTime = GetGameTimer()
        local dt = currentTime - lastTime
        local currentTransition = transition.None
        local newTarget = false

        sinceLastSync = sinceLastSync + dt

        if round.state == 'starting' then
            round.timerOfStart = round.timerOfStart - dt

            if round.timerOfStart <= 0 then
                newTarget = true
                currentTransition = transition.StartingToRunning

                round.state = 'running'
                round.timerOfStart = timeForStart

                -- assign to teams
                local sortedPlayers = {}

                for playerId, playerRnd in pairs(booking) do
                    table.insert(sortedPlayers, playerId)
                end

                table.sort(sortedPlayers, function(a, b) return booking[a] < booking[b] end)

                for index, playerId in ipairs(sortedPlayers) do
                    round.playersTeams[playerId] = index % 2
                end
            end

        elseif round.state == 'running' then
            local teamsMembersOnTarget = {}
            local playersOnTarget = 0

            local leadingTeam = -1
            local leadingTeamMembersOnTarget = 0

            for playerId, onTarget in pairs(round.playersAtTarget) do
                local playerTeam = round.playersTeams[playerId]

                if onTarget then
                    playersOnTarget = playersOnTarget + 1
                    local teamMembersOnTarget = teamsMembersOnTarget[playerTeam]

                    if teamMembersOnTarget then
                        teamsMembersOnTarget[playerTeam] = teamMembersOnTarget + 1
                    else
                        teamsMembersOnTarget[playerTeam] = 1
                    end

                    if teamsMembersOnTarget[playerTeam] > leadingTeamMembersOnTarget then
                        leadingTeam = playerTeam
                        leadingTeamMembersOnTarget = teamsMembersOnTarget[playerTeam]
                    end
                end
            end

            local contesting = true
            local meanNumberOfPlayersOnTarget = playersOnTarget / 2

            for team, membersOnTarget in pairs(teamsMembersOnTarget) do
                if meanNumberOfPlayersOnTarget ~= membersOnTarget then
                    contesting = false
                    break
                end
            end

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

                    local leadingTeamScore = round.score[leadingTeam + 1]
                    round.score[leadingTeam + 1] = leadingTeamScore + 1
                    round.timerOfTarget = timeForTarget
                end
            end

        elseif round.state == 'intermission' then
            round.timerOfIntermission = round.timerOfIntermission - dt

            if round.timerOfIntermission <= 0 then
                newTarget = true
                currentTransition = transition.IntermissionToRunning

                round.state = 'running'
                round.target = round.target + 1
                round.timerOfTarget = timeForTarget
                round.playersAtTarget = {}
                round.timerOfIntermission = timeForIntermission
            end
        end

        if targetCreationPending then
            round.timerOfTarget = timeForTarget
            round.playersAtTarget = {}
        end

        local needsRoutineSync = sinceLastSync > syncThreshold and round.state ~= 'idle'

        if currentTransition ~= transition.None or needsRoutineSync then
            emitSync(-1, currentTransition)
            sinceLastSync = 0
        end

        lastTime = currentTime
    end
end)
