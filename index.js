const mineflayer = require('mineflayer');
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalBlock } = require('mineflayer-pathfinder').goals
const c = require('ansi-colors');

const config = require('./settings.json');

function createBot() {
   const bot = mineflayer.createBot({
      username: config['Account']['Username'],
      password: config['Account']['Password'],
      auth: config['Account']['Type'],
      host: config.Server.IP,
      port: config.Server.Port,
      version: config.Server.Version,
   });

   bot.loadPlugin(pathfinder);
  
   const mcData = require('minecraft-data')(bot.version);
   const defaultMove = new Movements(bot, mcData);
   bot.settings.colorsEnabled = true;

   bot.once('spawn', () => {
     console.log(c.yellowBright.bold(' Bot Joined To The Server'));

      if (config.Utils['AutoPass'].Enabled) {
         console.log(c.cyan.bold(' AutoPass Enabled'));

         var password = config.Utils['AutoPass'].Password;
         setTimeout(() => {
            bot.chat(`/register ${password} ${password}`);
            bot.chat(`/login ${password}`);
         }, 1024);
      }
     
      if (config.Utils['ChatMessages'].Enabled) {
         console.log(c.cyan.bold(' ChatMessages Enabled'));
         var messages = config.Utils['ChatMessages']['Messages'];

         if (config.Utils['ChatMessages'].Repeat) {
            var delay = config.Utils['ChatMessages']['RepeatDelay'];
            let i = 0;

            setInterval(() => {
               bot.chat(`${messages[i]}`);

               if (i + 1 == messages.length) {
                  i = 0;
               } else i++;
            }, delay * 1000);
         } else {
            messages.forEach((msg) => {
               bot.chat(msg);
            });
         }
      }

      const pos = config.position;

      if (config.Position.Enabled) {
         console.log(c.green.bold(
           `Moving To Target Location (${pos.x}, ${pos.y}, ${pos.z})`
         ));
        setTimeout(() => {
         bot.pathfinder.setMovements(defaultMove);
         bot.pathfinder.setGoal(new GoalBlock(pos.x, pos.y, pos.z));
          }, 2048);
      }

      if (config.Utils['AntiAfk'].Enabled) {
         bot.setControlState('jump', true);
        console.log(c.cyan.bold(` AntiAfk Enabled`));
      }
   });

   bot.on('message', message => {
      if (config.Utils['ChatLog']) {
         console.log(`${message.toAnsi()}`)
      }
   });

   bot.on('goal_reached', () => {
      console.log(c.green.bold(
         `Arrived To Location: ${bot.entity.position}`
      ));
   });

   bot.on('death', () => {
      console.log(c.yellow.bold(
         `Died And Respawned`,
      ));
   });

   if (config.Utils['AutoReconnect']) {
      bot.on('end', () => {
         setTimeout(() => {
            createBot();
         }, config.Utils['RecconectDelay']);
      });
   }

   bot.on('kicked', (reason) =>
      console.log(c.yellow.bold(
         `Kicked From The Server: ${reason}`,
      ))
   );
   bot.on('error', (err) =>
      console.log(c.red(`[ERROR] ${err.message}`))
   );
}

createBot();