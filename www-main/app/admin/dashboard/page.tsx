import Link from 'next/link';

function AdminDashboardPage() {
  return (
    <div className="rounded-2xl p-8 bg-white dark:bg-gray-800 dark:text-gray-200">
      <h2 className="text-headline6 font-bold">Dashboards</h2>
      <ul className="max-w-screen-2xl mx-auto my-2 font-bodycopy">
        <li className="hover:underline">
          <Link href="/admin/dashboard/courses">Course Dashboards</Link>
        </li>
        <li className="hover:underline">
          <Link href="/admin/dashboard/creators">Creator Dashboards</Link>
        </li>
      </ul>
    </div>
  );
}

export default AdminDashboardPage;
