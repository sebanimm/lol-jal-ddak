from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing_extensions import Annotated
from dotenv import load_dotenv
import os
import requests
import math

load_dotenv()
API_KEY = os.getenv("API_KEY")

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def get_match_stats_by_duration(api_key, region, summoner_name):
    region_to_continent = {
        "br1": "americas",
        "eun1": "europe",
        "euw1": "europe",
        "jp1": "asia",
        "kr": "asia",
        "la1": "americas",
        "la2": "americas",
        "na1": "americas",
        "oc1": "asia",
        "ph2": "asia",
        "ru": "europe",
        "sg2": "asia",
        "th2": "asia",
        "tr1": "europe",
        "tw2": "asia",
        "vn2": "asia",
    }

    # Get the corresponding continent based on the region
    continent = region_to_continent.get(region, "kr")

    # Get summoner ID
    summoner_url = f"https://{region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/{summoner_name}?api_key={api_key}"
    summoner_response = requests.get(summoner_url)
    summoner_data = summoner_response.json()
    summoner_puuid = summoner_data["puuid"]

    # Get match list
    matchlist_url = f"https://{continent}.api.riotgames.com/lol/match/v5/matches/by-puuid/{summoner_puuid}/ids?count=100&type=ranked&api_key={api_key}"
    matchlist_response = requests.get(matchlist_url)
    matchlist_data = matchlist_response.json()

    if len(matchlist_data) == 0:
        return ["최근 전적이 존재하지 않습니다", 0]

    # Initialize variables for win and total games by duration
    wins_by_duration = [0 for _ in range(12)]
    count = 0
    # Iterate through recent matches
    for game in matchlist_data:
        try:
            # Get match details
            match_url = f"https://{continent}.api.riotgames.com/lol/match/v5/matches/{game}?api_key={api_key}"
            match_response = requests.get(match_url)
            match_data = match_response.json()

            # Get the duration of the match in seconds
            duration_seconds = match_data["info"]["gameDuration"]

            # Round the duration to the nearest interval
            duration_minutes = (duration_seconds // 60) % 60
            duration_seconds %= 60
            if duration_seconds < 10:
                duration_seconds = f"0{duration_seconds}"
            if duration_minutes < 10:
                duration_minutes = f"0{duration_minutes}"
            duration = f"{duration_minutes}:{duration_seconds}"
            duration_minutes = int(duration_minutes)
            duration_seconds = int(duration_seconds)

            # Check if the player won
            for participant in match_data["info"]["participants"]:
                if participant["puuid"] == summoner_puuid:
                    count += 1
                    if (
                        participant["puuid"] == summoner_puuid
                        and participant["win"] == True
                    ):
                        wins_by_duration[math.floor(duration_minutes / 5)] += 1
        except:
            continue

    return [wins_by_duration, count]


@app.get("/")
async def get_data(
    summoner_name: Annotated[str, Query()], region: Annotated[str, Query()]
):
    wins_by_duration, count = await get_match_stats_by_duration(
        API_KEY, region, summoner_name
    )
    if wins_by_duration == "최근 전적이 존재하지 않습니다":
        print("최근 전적이 존재하지 않습니다.")
    else:
        for i in range(2, 12):
            print(f"{i*5}~{(i*5)+5}분 승리 횟수 : {wins_by_duration[i]}회")
        print(f"최근 랭크게임 {count}회 승률 : {(sum(wins_by_duration)/count)*100}%")
        return wins_by_duration, count
