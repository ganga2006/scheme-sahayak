import { useState } from "react";
import { STATES } from "../translations.js";

const OCCUPATIONS = ["farmer", "street-vendor", "artisan", "self-employed", "salaried", "daily-wage", "student", "homemaker", "unemployed"];

export default function ProfileForm({ t, onSubmit, initial }) {
  const [f, setF] = useState(
    initial || {
      age: "", gender: "female", state: "Telangana", residence: "rural",
      occupation: "farmer", incomeAnnual: "", category: "general",
      maritalStatus: "married", disability: false, motherhood: false, girlChild: false
    }
  );

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  function submit(e) {
    e.preventDefault();
    onSubmit({ ...f, age: Number(f.age), incomeAnnual: Number(f.incomeAnnual) });
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="grid2">
        <label>{t.age}
          <input id="age" name="age" type="number" min="0" max="120" required value={f.age} onChange={set("age")} placeholder="35" />
        </label>
        <label>{t.gender}
          <select id="gender" name="gender" value={f.gender} onChange={set("gender")}>
            <option value="female">{t.female}</option>
            <option value="male">{t.male}</option>
            <option value="other">{t.other}</option>
          </select>
        </label>
        <label>{t.state}
          <select id="state" name="state" value={f.state} onChange={set("state")}>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label>{t.residence}
          <select id="residence" name="residence" value={f.residence} onChange={set("residence")}>
            <option value="rural">{t.rural}</option>
            <option value="urban">{t.urban}</option>
          </select>
        </label>
        <label>{t.occupation}
          <select id="occupation" name="occupation" value={f.occupation} onChange={set("occupation")}>
            {OCCUPATIONS.map((o) => <option key={o} value={o}>{t.occupations[o]}</option>)}
          </select>
        </label>
        <label>{t.income}
          <input id="incomeAnnual" name="incomeAnnual" type="number" min="0" required value={f.incomeAnnual} onChange={set("incomeAnnual")} placeholder="120000" />
        </label>
        <label>{t.category}
          <select id="category" name="category" value={f.category} onChange={set("category")}>
            <option value="general">General</option>
            <option value="obc">OBC</option>
            <option value="sc">SC</option>
            <option value="st">ST</option>
          </select>
        </label>
        <label>{t.maritalStatus}
          <select id="maritalStatus" name="maritalStatus" value={f.maritalStatus} onChange={set("maritalStatus")}>
            <option value="single">{t.single}</option>
            <option value="married">{t.married}</option>
            <option value="widowed">{t.widowed}</option>
          </select>
        </label>
      </div>

      <div className="checks">
        <label className="check"><input id="disability" name="disability" type="checkbox" checked={f.disability} onChange={set("disability")} /> {t.disability}</label>
        <label className="check"><input id="motherhood" name="motherhood" type="checkbox" checked={f.motherhood} onChange={set("motherhood")} /> {t.motherhood}</label>
        <label className="check"><input id="girlChild" name="girlChild" type="checkbox" checked={f.girlChild} onChange={set("girlChild")} /> {t.girlChild}</label>
      </div>

      <button className="cta" type="submit">{t.find} →</button>
    </form>
  );
}
