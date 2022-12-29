import { locationsTable } from "../lib/locationsTable"

export default function FindLocations(cityName) {
  return locationsTable.find(location => location.cityName === cityName)
}