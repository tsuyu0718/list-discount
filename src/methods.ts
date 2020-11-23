import { DataClass, Price } from "./interface/price-type";
import  axios, { AxiosRequestConfig } from 'axios';
import { Game, App, Response } from "./interface/app-type";
import { API_KEY } from "./utils";

var games: Game[] = [];
const STEAM_APP_API =
  "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001";
const STEAM_STORE_API = "https://store.steampowered.com/api/appdetails/";
const STEAM_STORE_URL = "https://store.steampowered.com/app/";
const JSON_FORMAT = "json";
const PRICE_OVERVIEW = "price_overview";


export async function getGameList(id: string) : Promise<string[]> {
  return new Promise((resolve, reject) => {
    const message: string[] = [];
    getGames(id).then((results) => {
      games = results.sort(function (a: Game, b: Game) {
        return a.appid - b.appid;
      });
      getDiscount(
        games
          .map((game) => game.appid)
          .sort(function (a, b) {
            return a - b;
          })
      ).then((results) => {
        const array: Price[] = Object.keys(results).map((key: any) => results[key]);
        array.forEach((result, index) => {
          if (result.success === true &&
            result.data !== [] && (result.data as DataClass).price_overview !== undefined) {
            const price_overview = (result.data as DataClass).price_overview;
          
            if (
              price_overview !== undefined &&
              price_overview.discount_percent !== undefined &&
              price_overview.discount_percent !== 0
            ) {
              message.push("==============");
              message.push(games[index].name + '');
              message.push( 
                price_overview.final_formatted +
                " - " +
                price_overview.discount_percent +
                "% OFF"
              );
              message.push(STEAM_STORE_URL + games[index].appid);
            }
          }
        });
        resolve(message);
      }).catch((e) => {
        console.log(e);
        reject(message);
      });
    });
  });
}

export async function getGames(id: string) {
  const config: AxiosRequestConfig = {
    params: {
      key: API_KEY,
      steamid: id,
      format: JSON_FORMAT,
      include_appinfo: true,
    },
  };

  const res = await axios.get<App>(STEAM_APP_API, config);
  const responseApp: Response = res.data.response;
  return responseApp.games;
}

export async function getDiscount(appids: number[]) {
  const paramAppIds: string = appids.join(",");
  const config: AxiosRequestConfig = {
    params: {
      appids: paramAppIds,
      filters: PRICE_OVERVIEW,
    },
  };

  const res = await axios.get<Price[]>(STEAM_STORE_API, config);

  const responseStore: Price[] = res.data;

  return responseStore;
}