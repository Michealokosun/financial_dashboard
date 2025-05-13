import { fetchAllCustomers, fetchFilteredCustomers } from "@/app/lib/data";
import CustomersTable from "@/app/ui/customers/table";
type SearchParams = Promise<{ [key: string]: string }>;

export default async function page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  let customers;
  const query = searchParams.query || "";
  console.log(query);
  if (query == "") {
    customers = await fetchAllCustomers();
  } else {
    customers = await fetchFilteredCustomers(query);
  }

  return (
    <div>
      <CustomersTable customers={customers} />
    </div>
  );
}
