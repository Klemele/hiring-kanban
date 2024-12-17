defmodule Wttj.Candidates.Candidate do
  use Ecto.Schema
  import Ecto.Changeset

  schema "candidates" do
    field :position, :integer
    field :status, Ecto.Enum, values: [:new, :interview, :rejected, :hired], default: :new
    field :email, :string
    field :job_id, :id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(candidate, attrs) do
    candidate
    |> cast(attrs, [:email, :status, :position, :job_id])
    |> validate_required([:email, :status, :position, :job_id])
  end

  defimpl Jason.Encoder, for: Wttj.Candidates.Candidate do
    def encode(%Wttj.Candidates.Candidate{} = candidate, opts) do
      candidate
      |> Map.from_struct()
      # Drop any fields you don't want to serialize
      |> Map.drop([:__meta__])
      |> Jason.Encode.map(opts)
    end
  end
end
