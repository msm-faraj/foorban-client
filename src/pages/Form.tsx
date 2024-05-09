import { useEffect, useRef, useState } from "react";
import { BaseResponse } from "../interfaces";

export function Form() {
  const [status, setStatus] = useState<
    | "INITIAL"
    | "SEND_DATA"
    | "SENDING_DATA"
    | "DATA_SENDED"
    | "ERROR_SENDING_DATA"
  >();
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<number>();
  const [married, setMarried] = useState();
  const [dateOfBirth, setDateOfBirth] = useState();
  const [data, setData] = useState<BaseResponse>();
  const [errMsg, setErrMsg] = useState<string>();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "SEND_DATA") {
      setStatus("SENDING_DATA");
      fetch("http://localhost:3001/info/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
        }),
      })
        .then((rawResponse) => {
          if ([200, 201].includes(rawResponse.status)) {
            return rawResponse.json();
          } else {
            throw new Error();
          }
        })
        .then((response: BaseResponse) => {
          setStatus("DATA_SENDED");
          setData(response);
        })
        .catch((e) => {
          setStatus("ERROR_SENDING_DATA");
        });
    }
  });

  useEffect(() => {
    if (nameRef.current !== null) {
      nameRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [name, age, married, dateOfBirth]);

  if (status === "ERROR_SENDING_DATA") {
    return (
      <div>
        <h1>Data Sending Error</h1>
        <button onClick={() => setStatus("INITIAL")}>Try Again</button>
      </div>
    );
  }

  if (status === "SEND_DATA" || status === "SENDING_DATA") {
    return (
      <div>
        <h1>Sending</h1>
        <button onClick={() => setStatus("INITIAL")}>Cancel</button>
      </div>
    );
  }

  if (status === "DATA_SENDED") {
    return (
      <div>
        {data?.success === true && <h1>Valid Data Sent</h1>}
        {data?.success === false && <h1>Invalid Data Sent</h1>}
        <button onClick={() => setStatus("INITIAL")}>Send Another Value</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Enter Your Name</h1>
      <form>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          ref={nameRef}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />

        <label htmlFor="age">Age</label>
        <input
          id="age"
          type="number"
          value={age}
          onChange={(e) => {
            setAge(parseInt(e.target.value));
          }}
        />

        <label htmlFor="married">Married</label>
        <input id="married" type="checkbox" />

        <label htmlFor="date-of-birth">Date Of Birth</label>
        <input id="date-of-birth" type="date" />
      </form>
      <button onClick={() => setStatus("SEND_DATA")}>VALIDA</button>
    </div>
  );
}
