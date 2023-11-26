import React from "react";
import getData from "./fetch";

const Data = () => {
  const [input, setInput] = React.useState("");
  const [data, setData] = React.useState([]);
  const [result, setResult] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const [grade, setGrade] = React.useState();
  const [strength, setStrength] = React.useState();

  const handleInput = (e) => {
    setInput(e.currentTarget.value);
  };

  const timeout = setTimeout(() => {
    setCount(count + 1);
  }, 1000);
  React.useEffect(() => {
    clearTimeout(timeout);
  }, [loading]);

  const handleAnalysis = async () => {
    try {
      setLoading(true);
      const { data } = await getData(input, "kr");
      setLoading(false);
      if (data === null) {
        setData(null);
        return;
      }
      let sum = 0;
      const count = data[1];
      let dataList = [];
      for (let i = 2; i < 12; i++) {
        dataList.push(data[0][i]);
        sum += data[0][i];
      }
      setData(dataList);
      let rate = (sum / count) * 100;
      setResult(`최근 랭크게임 ${count}회 승률 : ${rate.toFixed(1)}%`);
      const earlyPhase = dataList[0] + dataList[1] + dataList[2];
      const midPhase = dataList[3] + dataList[4] + dataList[5];
      const endPhase = sum - earlyPhase - midPhase;
      const best =
        (earlyPhase > midPhase ? earlyPhase : midPhase) > endPhase
          ? earlyPhase > midPhase
            ? earlyPhase
            : midPhase
          : endPhase;

      if (best === earlyPhase)
        setStrength("당신의 강점은 초반 라인전 / 정글싸움을 통한 게임 리드!");
      else if (best === midPhase)
        setStrength("당신의 강점은 중반 한타 집중력!");
      else if (best === midPhase)
        setStrength("당신의 강점은 성장을 통한 후반 캐리력!");
      if (rate >= 60) setGrade("당신의 롤 등급 : S+");
      else if (rate >= 58) setGrade("당신의 롤 등급 : S");
      else if (rate >= 56) setGrade("당신의 롤 등급 : S-");
      else if (rate >= 54) setGrade("당신의 롤 등급 : A+");
      else if (rate >= 53) setGrade("당신의 롤 등급 : A");
      else if (rate >= 52) setGrade("당신의 롤 등급 : A-");
      else if (rate >= 50) setGrade("당신의 롤 등급 : B+");
      else if (rate >= 49) setGrade("당신의 롤 등급 : B");
      else if (rate >= 48) setGrade("당신의 롤 등급 : B-");
      else if (rate >= 47) setGrade("당신의 롤 등급 : C+");
      else if (rate >= 45) setGrade("당신의 롤 등급 : C-");
      else setGrade("당신의 롤 등급 : D");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>랭겜 전적 분석</h1>
      <h3>
        롤 닉네임 :{" "}
        <input
          value={input}
          onChange={handleInput}
          placeholder="롤 닉네임을 적어주세요"
          type="text"
        />
      </h3>
      {loading ? (
        <p>전적을 불러오는 중{".".repeat((count % 3) + 1)}</p>
      ) : data === null ? (
        <h4>최근 전적이 존재하지 않습니다.</h4>
      ) : (
        <>
          {data.map((element, index) => {
            return (
              <div key={index}>
                {(index + 2) * 5}~{(index + 2) * 5 + 5}분 승리 횟수 : {element}
                회
              </div>
            );
          })}
          <p>{result}</p>
          <h4>{grade}</h4>
          <h4>{strength}</h4>
        </>
      )}
      <button onClick={handleAnalysis}>분석 시작</button>
    </div>
  );
};

export default Data;
