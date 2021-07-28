require("dotenv/config");
const { ReactionRoleManager } = require("discord.js-collector");
const { Client } = require("discord.js");
const client = new Client();

const reactionRoleManager = new ReactionRoleManager(client, {
  storage: true,
  mongoDbLink:
    "mongodb+srv://mefiubot:19942811a@cluster0.r1tic.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", // See here to see how setup mongoose: https://github.com/IDjinn/Discord.js-Collector/blob/master/examples/reaction-role-manager/Note.md
});

client.on("ready", () => {
  console.log("ready");
});

reactionRoleManager.on("reactionRoleAdd", (member, role) => {
  console.log(`${member.displayName} tem o cargo ${role.name}`);
});

reactionRoleManager.on("reactionRoleRemove", (member, role) => {
  console.log(`${member.displayName} perdeu o cargo ${role.name}`);
});

reactionRoleManager.on("allReactionsRemove", (message) => {
  console.log(
    `Todas as reaçoes da menssagem ${message.id} foi removida, entao todos os cargos dados tambem foram`
  );
});

client.on("message", async (message) => {
  const client = message.client;
  const args = message.content.split(" ").slice(1);
  // +criarReacao @cargo :emoji: MessageId
  if (message.content.startsWith(process.env.PREFIX + "criarReacao")) {
    const role = message.mentions.roles.first();
    if (!role)
      return message
        .reply("Voce precisa mencionar um cargo")
        .then((m) => m.delete({ timeout: 1000 }));

    const emoji = args[1];
    if (!emoji)
      return message
        .reply("Use um emoji valido")
        .then((m) => m.delete({ timeout: 1000 }));

    const msg = await message.channel.messages.fetch(args[2] || message.id);
    if (!role)
      return message
        .reply("Mensagem nao encontrada")
        .then((m) => m.delete({ timeout: 1000 }));

    reactionRoleManager.createReactionRole({
      message: msg,
      roles: [role],
      emoji,
      type: 1,
    });
    /**
     * Reaction Role Type
     * NORMAL [1] - This role works like basic reaction role.
     * TOGGLE [2] - You can win only one role of all toggle roles in this message (like colors system)
     * JUST_WIN [3] - This role you'll only win, not lose.
     * JUST_LOSE [4] - This role you'll only lose, not win.
     * REVERSED [5] - This is reversed role. When react, you'll lose it, when you take off reaction you'll win it.
     */

    message.reply("Feito!").then((m) => m.delete({ timeout: 500 }));
  } else if (message.content.startsWith(process.env.PREFIX + "deletarReacao")) {
    const emoji = args[1];
    if (!emoji)
      return message
        .reply("Use um emoji valido")
        .then((m) => m.delete({ timeout: 1000 }));

    const msg = await message.channel.messages.fetch(args[1]);
    if (!msg)
      return message
        .reply("Mensagem nao encontrada")
        .then((m) => m.delete({ timeout: 1000 }));

    await reactionRoleManager.deleteReactionRole({ message: msg, emoji });
  }
});

client.on("message", (msg) => {
  if (msg.content.toLowerCase().startsWith(process.env.PREFIX + "limpar")) {
    if (msg.member.hasPermission("ADMINISTRATOR")) {
      const args = msg.content.split(" ").slice(1);
      if (args[0] > 100 || args[0] < 1) {
        msg.reply("Use um valor válido entre 1 e 100");
      } else {
        async function clear() {
          msg.delete();
          msg.channel.bulkDelete(args[0]);
        }
        clear();
      }
    } else {
      msg.reply("Voce nao tem permissao para isso");
    }
  }
});

client.login(process.env.TOKEN);
