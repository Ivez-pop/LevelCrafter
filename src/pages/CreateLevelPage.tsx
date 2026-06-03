import DifficultySelector from "../components/DifficultySelector";

function CreateLevelPage() {
  const handleDifficultySelect = (difficulty: "easy" | "medium" | "hard") => {
    console.log(difficulty);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center pt-20">
      <h1 className="mb-8 text-4xl font-bold">Create Level</h1>

      <DifficultySelector onSelect={handleDifficultySelect} />
    </div>
  );
}

export default CreateLevelPage;
