import { Skills } from "./skills";
import { Profile } from "./profile";
import { Conversation } from "./conversation";

export const Sidebar = () => {
  return (
    <aside className="md:col-span-1">
      {/* Profile Section */}
      <Profile />
      {/* Skills Section */}
      <Skills id="skills" />
      {/* Conversation Section */}
      <Conversation id="conversation" />
    </aside>
  )
}