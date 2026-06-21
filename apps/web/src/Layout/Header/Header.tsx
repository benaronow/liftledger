import { useLocation, useNavigate } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { RouteType } from "../../routeTypes";
import { useMe, useProgram } from "@liftledger/api-client";
import styles from "./header.module.css";
import { useTheme } from "../../providers/ThemeProvider";

export const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user: auth0User } = useAuth0();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { colors } = useTheme();

  const getTitle = () => {
    if (pathname.includes(RouteType.Progress)) return "Progress";
    if (pathname.includes(RouteType.History)) return "History";
    if (pathname.includes(RouteType.Add))
      return curProgram ? "Edit Program" : "Create Program";
    if (pathname.includes(RouteType.Settings)) return "Settings";
    if (pathname.includes(RouteType.Profile)) return "Profile";
    if (pathname.includes(RouteType.Workout)) return "Workout";
    return "Home";
  };

  if (pathname === "/" || !auth0User || !curUser) return null;

  return (
    <div
      className={`${styles.containerAnimate} d-flex align-items-center`}
      style={{
        background: colors.dark,
        height: "50px",
        width: "100%",
        zIndex: 10,
        borderRadius: "0 0 20px 20px",
      }}
    >
      <div
        className="d-flex"
        style={{ width: "50%", justifyContent: "flex-start" }}
      >
        <span
          className="text-white text-nowrap"
          style={{
            fontSize: "25px",
            fontFamily: "Mina",
            fontWeight: 700,
            marginLeft: "15px",
            height: "35px",
            borderRadius: "17.5px",
          }}
        >
          {getTitle()}
        </span>
      </div>
      <div
        className="d-flex align-items-center"
        style={{ width: "50%", justifyContent: "flex-end" }}
      >
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            marginRight: "10px",
            height: "32px",
            width: "32px",
            borderRadius: "16px",
            background: "white",
            color: "#6d6e71",
            cursor: "pointer",
          }}
          onClick={() => {
            navigate("/profile");
          }}
        >
          {auth0User?.picture && (
            <img
              src={auth0User.picture}
              alt=""
              style={{
                height: "32px",
                width: "32px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
