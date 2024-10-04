const generateOtp = (): string => {
  const otp: number = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

export default generateOtp;
