import { getCountries } from "@/app/_lib/data-service";


async function SelectCountry({ defaultCountry, name, id, className }) {
  const countries = await getCountries();

  const flag =
    countries.find((country) => country.name === defaultCountry)?.flags.png ??
    "";

  return (
    <select
      name={name}
      id={id}
      defaultValue={`${defaultCountry}%${flag}`}
      className={className}
    >
      <option value="">Select country...</option>
      {countries.map((c) => (
        <option key={c.name.common} value={`${c.name.common}%${c.flags.png}`}>
          {c.name.common}
        </option>
      ))}
    </select>
  );
}

export default SelectCountry;
