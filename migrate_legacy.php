<?php
$projects = App\Models\Project::whereNotNull('banner_reel')->where('banner_reel', '!=', '')->whereNotIn(DB::raw('LOWER(TRIM(banner_reel))'), ['na', 'n/a'])->get();
$count = 0;
foreach ($projects as $p) {
    $br = strtoupper(trim($p->banner_reel));
    $b = 0; $r = 0; $d = 0;
    
    if (preg_match('/(\d+)\s*B/', $br, $matches)) {
        $b = (int)$matches[1];
    } elseif (preg_match('/^(\d+)$/', $br, $matches)) {
        $b = (int)$matches[1];
    }
    
    if (preg_match('/(\d+)\s*R/', $br, $matches)) {
        $r = (int)$matches[1];
    }
    
    if (preg_match('/(\d+)\s*D/', $br, $matches)) {
        $d = (int)$matches[1];
    }
    
    if ($b > 0 || $r > 0 || $d > 0) {
        $p->total_banners = max($p->total_banners, $b);
        $p->total_reels = max($p->total_reels, $r);
        $p->total_dvc = max($p->total_dvc, $d);
        $p->banner_reel = 'NA';
        $p->save();
        $count++;
    }
}
echo "Migrated $count banner_reel entries.\n";

$dvcProjects = App\Models\Project::whereNotNull('dvc')->where('dvc', '!=', '')->whereNotIn(DB::raw('LOWER(TRIM(dvc))'), ['na', 'n/a'])->get();
$dcount = 0;
foreach ($dvcProjects as $p) {
    $val = trim($p->dvc);
    if (is_numeric($val)) {
        $p->total_dvc = max($p->total_dvc, (int)$val);
        $p->dvc = 'NA';
        $p->save();
        $dcount++;
    }
}
echo "Migrated $dcount dvc entries.\n";
