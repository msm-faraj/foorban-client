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
  const nameRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<BaseResponse>();

  const [age, setAge] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [married, setMarried] = useState<boolean | undefined>();

  const [nameErrors, setNameErrors] = useState<string[]>([]);
  const [ageErrors, setAgeErrors] = useState<string[]>([]);
  const [dateOfBirthErrors, setDateOfBirthErrors] = useState<string[]>([]);
  const [marriedErrors, setMarriedErrors] = useState<string[]>([]);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const resetErrorStates = () => {
    setNameErrors([]);
    setAgeErrors([]);
    setDateOfBirthErrors([]);
    setMarriedErrors([]);
  };

  const handleFormSubmission = () => {
    setStatus("SEND_DATA");
  };

  const handleServerResponse = (response: BaseResponse) => {
    if (response.success === false) {
      response.errors.forEach((error) => {
        switch (error.property) {
          case "name":
            setNameErrors(
              error.constraints ? Object.values(error.constraints) : []
            );
            break;
          case "age":
            setAgeErrors(
              error.constraints ? Object.values(error.constraints) : []
            );
            break;
          case "dateOfBirth":
            setDateOfBirthErrors(
              error.constraints ? Object.values(error.constraints) : []
            );
            break;
          case "married":
            setMarriedErrors(
              error.constraints ? Object.values(error.constraints) : []
            );
            break;
          default:
            break;
        }
      });
      setStatus("ERROR_SENDING_DATA");
    } else {
      setStatus("DATA_SENDED");
      setData(response);
    }
  };

  //this must change
  useEffect(() => {
    if (status === "SEND_DATA") {
      resetErrorStates();
      fetch("http://localhost:3001/info/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          age,
          married,
          dateOfBirth,
        }),
      })
        .then((rawResponse) => {
          if ([200, 201].includes(rawResponse.status)) {
            return rawResponse.json();
          } else {
            throw new Error("Failed to send data: " + rawResponse.status);
          }
        })
        .then((response: BaseResponse) => {
          handleServerResponse(response);
        })
        .catch((error) => {
          console.error("Error sending data:", error);
          setStatus("ERROR_SENDING_DATA");
        });
    }
  }, [status, name, age, married, dateOfBirth]);

  if (status === "SEND_DATA" || status === "SENDING_DATA") {
    return (
      <div>
        <h1>Sendign</h1>
        <button onClick={() => setStatus("INITIAL")}>Cancel</button>
      </div>
    );
  }
  if (status === "DATA_SENDED") {
    return (
      <div>
        {data?.success === true && <h1>Valid Data Sent</h1>}
        <button onClick={() => setStatus("INITIAL")}>
          Send Information Again
        </button>
      </div>
    );
  }

  return (
    <section className="form">
      <h1>Enter Your Information</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmission();
        }}
      >
        {/* NAME */}
        <label htmlFor="name" className="form-label">
          Name:
        </label>
        <input
          id="name"
          type="text"
          ref={nameRef}
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-input"
        />
        {nameErrors.map((error, index) => (
          <p key={index} className="error-message">
            {error}
          </p>
        ))}

        {/* AGE */}
        <label htmlFor="age" className="form-label">
          Age:
        </label>
        <input
          id="age"
          type="number"
          value={isNaN(age) ? "" : age}
          onChange={(e) => setAge(parseInt(e.target.value))}
          className="form-input"
        />
        {ageErrors.map((error, index) => (
          <p key={index} className="error-message">
            {error}
          </p>
        ))}

        {/* DATE OF BIRTH */}
        <label htmlFor="date-of-birth" className="form-label">
          Date Of Birth:
        </label>
        <input
          id="date-of-birth"
          type="date"
          value={dateOfBirth ? dateOfBirth.toISOString().substr(0, 10) : ""}
          onChange={(e) => setDateOfBirth(new Date(e.target.value))}
          className="form-input"
        />
        {dateOfBirthErrors.map((error, index) => (
          <p key={index} className="error-message">
            {error}
          </p>
        ))}

        {/* MARRIAGE */}
        <fieldset>
          <legend>Marriage:</legend>
          <div className="marriage">
            <div className="married">
              <label htmlFor="married-yes" className="form-radio-label">
                Married:
              </label>
              <input
                id="married-yes"
                type="radio"
                name="marriage"
                value="true"
                checked={married === true}
                onChange={() => setMarried(true)}
                className="form-radio-input"
              />
            </div>
            <div className="single">
              <label htmlFor="married-no" className="form-radio-label">
                Single:
              </label>
              <input
                id="married-no"
                type="radio"
                name="marriage"
                value="false"
                checked={married === false}
                onChange={() => setMarried(false)}
                className="form-radio-input"
              />
            </div>
          </div>
        </fieldset>
        {marriedErrors.map((error, index) => (
          <p key={index} className="error-message">
            {error}
          </p>
        ))}
        <button type="submit" className="form-submit-button">
          Submit
        </button>
      </form>
    </section>
  );
}
