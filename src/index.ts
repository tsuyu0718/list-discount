import { TOKEN } from "./utils";
import { Client } from 'discord.js';
import { getGameList } from "./methods";

const ACTIVITY_TYPE = 'PLAYING';
const ACTIVITY_NAME = '!help steamdiscount'
const DESCRIPTION =
  `どうもこんにちは！
  このbotは、あなたのライブラリにあるゲームのうち、割引されているゲームリスト(ゲーム名・URL・割引率・価格)をDMで教えてあげますよ。
  あなたのSteamIDを以下のようにメンションしてください。\n
  > @Steamセール教えるくん SteamID\n
  SteamIDは、\n1. Steamのユーザーページ上で右クリック\n2. 「ソースを見る」を選択する\n3. ソーステキストを"steamid"で検索し、数字のIDを探す
  ことで取得できます。(Steamのユーザー名ではないため注意)
  
  ※ 個人制作です。あまり作りが良くないので、動作に責任は持てません。`

const client = new Client();

client.login(TOKEN);

client.on('ready', () => {
  console.log('I am ready!');
  if (client.user !== null) {
    client.user.setActivity(ACTIVITY_NAME, { type: ACTIVITY_TYPE })
      .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
      .catch(console.error);
  }
});

client.on('message', async message => {

  // this bot for human only
  if (message.author.bot) {
    return;
  }
  
  if (message.content === ACTIVITY_NAME) {
    // reply how to use
    message.reply(DESCRIPTION);
  } else if (client.user !== null && message.mentions.users.has(client.user.id)) {
    // send gamelist by DM
    const regex = /<@.+>/;
    const id = message.content.replace(regex, '');
    console.log(`Get Steam ID: ${id}`);

    try {
      const gameList = await getGameList(id);
      if (gameList !== [] || gameList !== undefined || gameList !== null) {
        const authorId = message.author.id;
        const authorUser = client.users.cache.get(authorId);
        if (authorUser !== undefined) {
          let gameListMessage = '';
          for (const item of gameList) {
            gameListMessage = gameListMessage + item + '\n';
            if (gameListMessage.length > 1000) {
              authorUser.send(gameListMessage);
              gameListMessage = '';
            }
          }
          if (gameListMessage.length !== 0) {
            authorUser.send(gameListMessage);
          }
        } else {
          message.reply('error: discord user is not found');
        }
      } else {
        message.reply('error: failed getting game list from steam');
      }
    } catch (e) {
      console.log(e);
      message.reply('error: unknown error');
    }
  }
});

