import { Skills } from "./skills";
import { Profile } from "./profile";
import { Feedback } from "./feedback";

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