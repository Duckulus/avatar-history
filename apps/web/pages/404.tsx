import { Layout } from "../components/Layout";
import { NavBar, NavBarButton } from "../components/NavBar";

export default function PageNotFount() {
  return (
    <Layout>
      <NavBar>
        <NavBarButton
          text={"Home"}
          onClick={() => {
            const win: Window = window;
            win.location = "/";
          }}
          bold={false}
        />
      </NavBar>
      <div className={"border p10"}>Page not Found</div>
    </Layout>
  );
}
