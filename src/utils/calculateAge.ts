export const calculateAge = (dob: Date): number => {
  const diff = Date.now() - new Date(dob).getTime();
  // console.log(Date.now(), new Date(dob).getTime())
  const ageDate = new Date(diff);
  // console.log("age", ageDate)
  // console.log(Math.abs(ageDate.getUTCFullYear() - 1970))
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};
