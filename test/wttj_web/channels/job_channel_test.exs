defmodule WttjWeb.JobChannelTest do
  use WttjWeb.ChannelCase

  import Wttj.JobsFixtures

  import Wttj.CandidatesFixtures

  setup do
    job = job_fixture()
    {:ok, job: job}

    candidate = candidate_fixture(%{job_id: job.id, email: "user-51@example.com", status: :new})
    _ = candidate_fixture(%{job_id: job.id, position: 12, status: :new})

    {:ok, _, socket} =
      WttjWeb.JobSocket
      |> socket("user_id", %{some: :assign})
      |> subscribe_and_join(WttjWeb.JobChannel, "jobs:#{job.id}")

    %{socket: socket, job_id: job.id, candidate: candidate}
  end

  test "join/3 allows joining a job channel", %{socket: socket, job_id: job_id} do
    assert socket.topic == "jobs:#{job_id}"
  end

  test "get_candidates replies with candidate data", %{
    socket: socket,
    job_id: job_id,
    candidate: candidate
  } do
    push(socket, "get_candidates", %{"job_id" => job_id})

    assert_push "candidates_data", %{candidates: received_candidates}

    assert length(received_candidates) > 0
    assert Enum.any?(received_candidates, fn c -> c.id == candidate.id end)
  end

  test "update_candidate broadcasts updated candidate successfully", %{
    socket: socket,
    job_id: job_id,
    candidate: candidate
  } do
    update_params = %{
      "id" => candidate.id,
      "status" => :interview
    }

    push(socket, "update_candidate", %{"job_id" => job_id, "candidate" => update_params})

    assert_broadcast "candidate_updated", %{candidate: updated_candidate}
    assert updated_candidate.email == "user-51@example.com"
  end

  test "update_candidate handles non-existent candidate", %{socket: socket, job_id: job_id} do
    ref =
      push(socket, "update_candidate", %{
        "job_id" => job_id,
        "candidate" => %{"id" => 23_932_080_923}
      })

    assert_reply ref, :error, "candidate_not_found"
  end

  test "update_candidate handles invalid parameters", %{socket: socket, job_id: job_id} do
    ref = push(socket, "update_candidate", %{"job_id" => job_id, "candidate" => %{}})

    assert_reply ref, :error, "invalid_candidate_params"
  end

  # test "update_candidate handles update failure", %{
  #   socket: socket,
  #   job_id: job_id,
  #   candidate: candidate
  # } do
  #   update_params = %{
  #     "id" => candidate.id,
  #     "job_id" => job_id,
  #     position: 12
  #   }

  #   ref = push(socket, "update_candidate", %{"job_id" => job_id, "candidate" => update_params})

  #   assert_reply ref, :error, "update_failed"
  # end
end
