import axios from "axios";

const instance = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  headers: { "Content-Type": "application/json" },
});

const getData = async (name, region) => {
  try {
    const data = await instance.get(`/?summoner_name=${name}&region=${region}`);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export default getData;
