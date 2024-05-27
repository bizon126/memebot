import {Bot, Context, GrammyError, HttpError, Keyboard} from "grammy";
import fetch from "node-fetch";
import {JSDOM} from "jsdom"
import * as dotenv from "dotenv";


dotenv.config();

const BOT_TOKEN: string | undefined = process?.env?.BOT_TOKEN;
const DEST = ["https://www.memify.ru/highfive/", "https://www.anekdot.ru/random/mem/"];

interface memeParsing {
  query: string,
  attr: string,
  src?: string,
}

const MEMIFY: memeParsing = {
  query: ".card > figure > a",
  attr: "href"
};

const ANEKDOTMEME: memeParsing = {
  query: ".topicbox > .text > img",
  attr: "src"
}

const ANEKDOT: memeParsing = {
  query: ".topicbox > .text",
  attr: ""
}

const bot = new Bot(<string>BOT_TOKEN);

async function getMemes(): Promise<memeParsing> {
  return new Promise<memeParsing>(async (resolve, reject) => {
    let response = await fetch(DEST[0]);
    if (response.ok) {
      resolve({
        src: await response.text(),
        ...MEMIFY
      })
    } else {
      response = await fetch(DEST[1]);
      if (response.ok) {
        resolve({
          src: await response.text(),
          ...ANEKDOTMEME
        })
      }
    }
  });
}

function parse(domString: string, query: string, attr: string): string {
  const dom = new JSDOM(domString);
  return dom.window.document.querySelector(query).getAttribute(attr);
}


function sendRandomMeme(ctx: Context) {
  getMemes()
    .catch(err => console.error(err))
    .then((res) => {
      if (!res) {
        ctx.reply("Какая-то ошибка");
      } else {
        const memeURL = parse(<string>res.src, res.query, res.attr);
        ctx.replyWithPhoto(memeURL, {
          reply_markup: memeKeyboard,
        });
      }

  })
}

const memeKeyboard = new Keyboard().text('Случайный мем').row().resized();


bot.command("start", (ctx) => ctx.reply("Привет! Нажми кнопку и получи случайный мем )", {
  reply_markup: memeKeyboard,
}));

bot.command("meme", (ctx) => {
  sendRandomMeme(ctx);
});

bot.hears("Случайный мем", (ctx) => {
  sendRandomMeme(ctx);
})

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


bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`); const e = err.error;
  if (e instanceof GrammyError) {
    console.error('Error in request:', e.description);
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e);
  } else {
    console.error('Unknown error:', e);
  }
});


bot.start();
