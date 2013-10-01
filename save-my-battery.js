#!/usr/bin/env node

var exec = require('child_process').exec;
var notifier = require('node-notifier');
var terminalCommand = 'ioreg -n AppleSmartBattery -r';
var frequency = 5 * 60 * 1000;

var onTerminalOutput = function(error, stdout) {
    if (!stdout) return;
    var max = /"MaxCapacity" = (\d+)/m.exec(stdout)[1];
    var current = /"CurrentCapacity" = (\d+)/m.exec(stdout)[1];
    var pc = Math.round(current / max * 100);
    var isCharging = /"IsCharging" = Yes/.test(stdout);

    if (pc > 75 && isCharging) sendMessage(pc + '%: Unplug your battery.');
    if (pc < 40 && !isCharging) sendMessage(pc + '%: Plug in your battery.');
};

var getBatteryPC = function(){
    exec(terminalCommand, onTerminalOutput);
    setTimeout(getBatteryPC, frequency);
};

var sendMessage = function(message) {
    notifier.notify({
        title: '🔋 Battery Alert',
        message: message,
        group: 'balert',
        sender: 'balert'
    });
};

setTimeout(getBatteryPC, frequency);
getBatteryPC();
