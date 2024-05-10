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
  const [married, setMarried] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
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
          age: age,
          married: married,
          dateOfBirth: dateOfBirth,
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
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [name, age, married, dateOfBirth]);

  // Error in sending
  if (status === "ERROR_SENDING_DATA") {
    return (
      <div>
        <h1>Data Sending Error</h1>
        <button onClick={() => setStatus("INITIAL")}>Try Again</button>
      </div>
    );
  }

  // Sending
  if (status === "SEND_DATA" || status === "SENDING_DATA") {
    return (
      <div>
        <h1>Sending</h1>
        <button onClick={() => setStatus("INITIAL")}>Cancel</button>
      </div>
    );
  }

  // Data sent
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
    <div className="form">
      <h1>Enter Your Name</h1>
      <form>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          ref={nameRef}
          autoComplete="off"
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
        <input
          id="married"
          type="checkbox"
          value={married ? "true" : "false"}
          onChange={(e) => {
            setMarried(e.target.checked);
          }}
        />

        <label htmlFor="date-of-birth">Date Of Birth</label>
        <input
          id="date-of-birth"
          type="date"
          value={dateOfBirth ? dateOfBirth.toISOString().substr(0, 10) : ""}
          onChange={(e) => {
            setDateOfBirth(new Date(e.target.value));
          }}
        />
        <button onClick={() => setStatus("SEND_DATA")}>VALIDA</button>
      </form>
      {`${typeof name}${typeof age}${typeof married}${typeof dateOfBirth}`}
    </div>
  );
}
