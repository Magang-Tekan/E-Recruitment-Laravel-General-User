use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateApplicationHistoryTable extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('application_history')) {
            Schema::create('application_history', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('application_id');
                $table->unsignedBigInteger('candidate_id');
                $table->string('position_name');
                $table->unsignedBigInteger('company_id');
                $table->unsignedBigInteger('department_id');
                $table->text('job_description')->nullable();
                $table->enum('work_type', ['Full Time', 'Part Time', 'Contract', 'Internship'])->default('Full Time');
                $table->string('work_location')->nullable();
                $table->date('application_deadline')->nullable();
                $table->unsignedBigInteger('status_id');
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('application_history');
    }
}