<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->boot();

echo "Checking Vacancy and Question Pack relationships:\n\n";

$vacancies = \App\Models\Vacancies::with('questionPack')->take(5)->get(['id','title','question_pack_id']);

foreach ($vacancies as $v) {
    echo "Vacancy: " . $v->title . " (ID: " . $v->id . ")\n";
    echo "  => QuestionPack ID: " . ($v->question_pack_id ?? 'NULL') . "\n";
    echo "  => Pack Name: " . ($v->questionPack ? $v->questionPack->pack_name : 'NULL') . "\n\n";
}

echo "\nChecking Question Pack data:\n\n";

$questionPacks = \App\Models\QuestionPack::take(5)->get(['id','pack_name','test_type','opens_at','closes_at']);

foreach ($questionPacks as $qp) {
    echo "QuestionPack: " . $qp->pack_name . " (ID: " . $qp->id . ")\n";
    echo "  => Test Type: " . ($qp->test_type ?? 'NULL') . "\n";
    echo "  => Opens At: " . ($qp->opens_at ?? 'NULL') . "\n";
    echo "  => Closes At: " . ($qp->closes_at ?? 'NULL') . "\n\n";
}

echo "\nChecking Applications and their Vacancies:\n\n";

$applications = \App\Models\Applications::with(['vacancyPeriod.vacancy.questionPack', 'status'])
    ->take(3)
    ->get(['id','user_id','vacancy_period_id','status_id']);

foreach ($applications as $app) {
    echo "Application: " . $app->id . " (User: " . $app->user_id . ")\n";
    echo "  => Status: " . ($app->status ? $app->status->name : 'NULL') . "\n";
    echo "  => Vacancy: " . ($app->vacancyPeriod && $app->vacancyPeriod->vacancy ? $app->vacancyPeriod->vacancy->title : 'NULL') . "\n";
    echo "  => Vacancy Question Pack ID: " . ($app->vacancyPeriod && $app->vacancyPeriod->vacancy ? ($app->vacancyPeriod->vacancy->question_pack_id ?? 'NULL') : 'NULL') . "\n";
    echo "  => Question Pack Name: " . ($app->vacancyPeriod && $app->vacancyPeriod->vacancy && $app->vacancyPeriod->vacancy->questionPack ? $app->vacancyPeriod->vacancy->questionPack->pack_name : 'NULL') . "\n\n";
}