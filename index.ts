import {Bot, Keyboard} from "grammy";
import "dotenv/config";
import fetch from "node-fetch";
import { JSDOM } from "jsdom"


const BOT_TOKEN: string | undefined = process?.env?.BOT_TOKEN;
const DEST = 'https://www.memify.ru/highfive/';

const bot = new Bot(<string>BOT_TOKEN);

async function getMemes(): Promise<string> {
  const response = fetch(DEST);
  return (await response).text();
}

const memeKeyboard = new Keyboard().placeholder('Случайный мем').text('/meme').row().resized();


bot.command("start", (ctx) => ctx.reply("Привет! Нажми кнопку и получи случайный мем )", {
  reply_markup: memeKeyboard,
}));

bot.command("meme", (ctx) => {
  getMemes().then((res) => {
    let arr = [];
    const dom = new JSDOM(res);
    dom.window.document.querySelectorAll(".card > figure > a").forEach((el) => {
      arr.push(el.getAttribute('href'))
    });

    ctx.reply(arr[Math.floor(Math.random() * 5)], {
      reply_markup: memeKeyboard,
    });
  })
});

bot.command("pashalka", (ctx) => {
  ctx.reply("СВОБОДА! РАВЕНСТВО! УПЯЧКА!\n" +
    "УПЯЧКА СЛЕДИТ ЗА ТОБОЙ!!!\n");
  ctx.reply('https://upyachka.io/img/up4kman.gif');
  ctx.reply('УПЯЧКА!!!!!11111', {
    reply_markup: memeKeyboard
  });
})


bot.on("message", (ctx) => ctx.reply("Продолжай...", {
  reply_markup: memeKeyboard
}));


bot.start();
