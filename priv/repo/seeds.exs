try do
  Wttj.Jobs.get_job!(1)
  IO.puts("Job with ID 1 already exists. No new data created.")
rescue
  Ecto.NoResultsError ->
    IO.puts("Seeding data...")
    {:ok, job} = Wttj.Jobs.create_job(%{name: "Full Stack Developer"})

    Wttj.Candidates.create_candidate(%{job_id: job.id, email: "user1@wttj.co", position: 0})
    Wttj.Candidates.create_candidate(%{job_id: job.id, email: "user2@wttj.co", position: 1})

    Wttj.Candidates.create_candidate(%{
      job_id: job.id,
      email: "user3@wttj.co",
      position: 0,
      status: :interview
    })

    Wttj.Candidates.create_candidate(%{
      job_id: job.id,
      email: "user4@wttj.co",
      position: 0,
      status: :rejected
    })

    Wttj.Candidates.create_candidate(%{
      job_id: job.id,
      email: "user5@wttj.co",
      position: 1,
      status: :rejected
    })
end
