import {Bot, Keyboard, webhookCallback} from "grammy";
import "dotenv/config";
import fetch from "node-fetch";
import {JSDOM} from "jsdom";
import * as functions from "firebase-functions";


const BOT_TOKEN: string | undefined = process?.env?.BOT_TOKEN;
const DEST = "https://www.memify.ru/highfive/";

const bot = new Bot(<string>BOT_TOKEN);
export const memebot = functions.https.onRequest(webhookCallback(bot));

/**
 * Get 5 memes from memify
 */
async function getMemes(): Promise<string> {
  const response = fetch(DEST);
  return (await response).text();
}

const memeKeyboard = new Keyboard()
  .text("/meme")
  .row()
  .resized();


bot.command("start", (ctx) => {
  ctx.reply("Привет! Нажми кнопку и получи случайный мем )", {
    reply_markup: memeKeyboard,
  });
});

bot.command("meme", (ctx) => {
  getMemes().then((res) => {
    const arr: string[] = [];
    const dom = new JSDOM(res);
    dom.window.document.querySelectorAll(".card > figure > a").forEach((el) => {
      if (el.getAttribute("href")) arr.push(<string>el.getAttribute("href"));
    });

    ctx.reply(arr[Math.floor(Math.random() * 5)], {
      reply_markup: memeKeyboard,
    });
  });
});

bot.command("pashalka", (ctx) => {
  ctx.reply("СВОБОДА! РАВЕНСТВО! УПЯЧКА!\n" +
    "УПЯЧКА СЛЕДИТ ЗА ТОБОЙ!!!\n");
  ctx.reply("https://upyachka.io/img/up4kman.gif");
  ctx.reply("УПЯЧКА!!!!!11111", {
    reply_markup: memeKeyboard,
  });
});


bot.on("message", (ctx) => ctx.reply("Продолжай...", {
  reply_markup: memeKeyboard,
}));


bot.start();
