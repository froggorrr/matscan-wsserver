import supabase from "../services/supabaseClient.js";
import { searchTx } from "../controllers/search.js";
export async function updateUsers(users) {

    if (users.updateTo === "both") {
      return
    }

  const { data, error } = await supabase
    .from("users")
    .update({
      balance: users.receiverBalance ? users.receiverBalance : users.senderBalance,
      last_updated: Date.now(),
      tx_count:(await searchTx(users.updateTo)).total_results,
    })
    .eq("username",users.updateTo);
  return { data, error };
}
