import { Skills } from "./Skills";
import { Profile } from "./Profile";
import { Feedback } from "./Feedback";

export const Sidebar = () => {
  return (
    <aside className="md:col-span-1">
      {/* Profile Section */}
      <Profile />
      {/* Skills Section */}
      <Skills id="skills" />
      {/* Feedback Section */}
      <Feedback id="feedback" />
    </aside>
  )
}