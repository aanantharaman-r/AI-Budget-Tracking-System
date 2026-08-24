import { useEffect, useState } from "react";

function BackendTest() {
  const [budget, setBudget] = useState(null);

  const [salary, setSalary] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");

  // GET - Backend-la irundhu data edukkum
  useEffect(() => {
    fetch("http://localhost:5000/api/budget")
      .then((response) => response.json())
      .then((data) => {
        setBudget(data);
      })
      .catch((error) => {
        console.error("Backend error:", error);
      });
  }, []);

  // POST - Frontend-la irundhu backend-ku data anuppum
  const saveBudget = () => {
    fetch("http://localhost:5000/api/budget", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        salary: Number(salary),
        monthlyBudget: Number(monthlyBudget),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Backend Response:", data);
        alert(data.message);
      })
      .catch((error) => {
        console.error("POST error:", error);
      });
  };

  return (
    <div>
      <h1>Backend Connection Test</h1>

      <h2>Data From Backend</h2>

      {budget && (
        <div>
          <p>Salary: ₹{budget.salary}</p>
          <p>Monthly Budget: ₹{budget.monthlyBudget}</p>
        </div>
      )}

      <hr />

      <h2>Send Data To Backend</h2>

      <div>
        <label>Salary: </label>

        <input
          type="number"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          placeholder="Enter salary"
        />
      </div>

      <br />

      <div>
        <label>Monthly Budget: </label>

        <input
          type="number"
          value={monthlyBudget}
          onChange={(e) => setMonthlyBudget(e.target.value)}
          placeholder="Enter budget"
        />
      </div>

      <br />

      <button onClick={saveBudget}>
        Save Budget
      </button>
    </div>
  );
}

export default BackendTest;