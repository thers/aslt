RegisterServerEvent('aslt:state:sync')
AddEventHandler('aslt:state:sync', function(key, value)
    RconPrint('aslt:state: key {' .. key .. '}, value {' .. value .. '}\n')
end)
