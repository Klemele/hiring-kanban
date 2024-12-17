defmodule WttjWeb.JobSocket do
  use Phoenix.Socket

  channel "jobs:*", WttjWeb.JobChannel

  @impl true
  def connect(_paras, socket, connect_info) do
    {:ok, put_in(socket.private[:connect_info], connect_info)}
  end

  @impl true
  def id(socket), do: socket.private.connect_info[:session]["live_socket_id"]
end
