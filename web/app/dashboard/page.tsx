import ButtonAccount from "@/components/ButtonAccount";
import Sidebar from "@/components/_features/Dashboard/Sidebar/Sidebar";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function Dashboard() {
  return (
    <main>
      <section className="max-w-xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-extrabold">Private Page</h1>

        <div className="min-h-screen ">
          <div className="flex flex-col md:flex-row">
            <aside className="w-full md:w-64 bg-white shadow-md md:min-h-screen md:fixed md:left-0 md:top-0 md:overflow-y-auto">
              <Sidebar />
            </aside>

            <main className="flex-1">Dashboard home</main>
          </div>
        </div>
      </section>
    </main>
  );
}
