import Link from "next/link";
import { Panel } from "../components/Layout";

export default function PageNotFound() {
  return (
      <Panel>
        <div className={"empty"}>
          <span className={"empty-icon"}>🛸</span>
          <h2>
            <span className={"gradient-text"}>404</span> - this page drifted off
          </h2>
          <p>There is nothing archived here.</p>
          <Link className={"btn btn-primary"} href={"/"}>
            Take me home
          </Link>
        </div>
      </Panel>
  );
}
