RegisterServerEvent('aslt:state:sync')
AddEventHandler('aslt:state:sync', function(key, value)
    Citizen.Trace('aslt:state: key {' .. key .. '}, value {' .. value .. '}\n')
end)

RegisterServerEvent('aslt:round:start')
AddEventHandler('aslt:round:start', function(seed)
    TriggerClientEvent('aslt:round:start', -1, seed)
end)
