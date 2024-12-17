defmodule WttjWeb.JobChannel do
  use WttjWeb, :channel

  alias Wttj.Candidates

  @impl true
  def join("jobs:" <> _job_id, _payload, socket) do
    {:ok, socket}
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  @impl true
  def handle_in("get_candidates", %{"job_id" => job_id}, socket) do
    candidates = Candidates.list_candidates(job_id)
    push(socket, "candidates_data", %{candidates: candidates})
    {:noreply, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (job:lobby).
  @impl true
  def handle_in(
        "update_candidate",
        %{"job_id" => job_id, "candidate" => candidate_params},
        socket
      ) do
    case candidate_params do
      %{"id" => id} ->
        case Candidates.get_candidate(job_id, id) do
          nil ->
            {:reply, {:error, "candidate_not_found"}, socket}

          Ecto.NoResultsError ->
            {:reply, {:error, "candidate_not_found"}, socket}

          candidate ->
            # Attempt to update the candidate
            case Candidates.update_candidate(candidate, candidate_params) do
              {:ok, updated_candidate} ->
                # Successfully updated candidate
                broadcast!(socket, "candidate_updated", %{candidate: updated_candidate})
                {:noreply, socket}

              {:error, _changeset} ->
                # Failed to update candidate
                {:reply, {:error, "update_failed"}, socket}
            end
        end

      _ ->
        {:reply, {:error, "invalid_candidate_params"}, socket}
    end
  end
end
