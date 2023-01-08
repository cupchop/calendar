<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;

class EventController extends Controller
{
    public function store(Request $request)
    {
        $event = new Event;
          logger($request->all());
        // 日付に変換。JavaScriptのタイムスタンプはミリ秒なので秒に変換
        $event->start_date = date('Y-m-d', $request->input('start_date') / 1000);
        $event->end_date = date('Y-m-d', $request->input('end_date') / 1000);
        $event->title = $request->input('title');
        $event->save();
    }
    public function getEvent(Request $request)
{
    // カレンダー表示期間
    $start_date = date('Y-m-d', $request->input('start_date') / 1000);
    $end_date = date('Y-m-d', $request->input('end_date') / 1000);

    // 登録処理
    return Event::query()
        ->select(
            // FullCalendarの形式に合わせる
            'start_date as start',
            'end_date as end',
            'title as title',
            'id'
        )
        // FullCalendarの表示範囲のみ表示
        ->where('end_date', '>', $start_date)
        ->where('start_date', '<', $end_date)
        ->get();
}
}