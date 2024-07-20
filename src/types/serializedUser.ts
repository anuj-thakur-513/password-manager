import passportGoogle from "passport-google-oauth20";

interface SerializedUser {
  id: string;
  profile: passportGoogle.Profile;
  accessToken: string;
  refreshToken: string;
}

export default SerializedUser;
