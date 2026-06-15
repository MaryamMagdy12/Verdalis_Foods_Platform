<?php

namespace App\Console\Commands;

use App\Models\Store;
use App\Services\NominatimGeocoder;
use Illuminate\Console\Command;

class GeocodeStoresCommand extends Command
{
    protected $signature = 'stores:geocode
                            {--dry-run : Show what would be updated without saving}';

    protected $description = 'Geocode stores that have no latitude/longitude (backfill coordinates from address)';

    public function handle(NominatimGeocoder $geocoder): int
    {
        $dryRun = $this->option('dry-run');

        $stores = Store::where(function ($q) {
            $q->whereNull('latitude')
                ->orWhereNull('longitude')
                ->orWhere('latitude', 0)
                ->orWhere('longitude', 0);
        })
            ->whereNotNull('address')
            ->where('address', '!=', '')
            ->orderBy('id')
            ->get();

        if ($stores->isEmpty()) {
            $this->info('No stores need geocoding. All stores already have coordinates.');
            return self::SUCCESS;
        }

        $this->info('Found ' . $stores->count() . ' store(s) to geocode.' . ($dryRun ? ' (dry run)' : ''));
        $bar = $this->output->createProgressBar($stores->count());
        $bar->start();

        $updated = 0;
        $failed = 0;

        foreach ($stores as $store) {
            $coords = $geocoder->geocode($store->address);
            if ($coords !== null) {
                if (! $dryRun) {
                    $store->latitude = $coords['latitude'];
                    $store->longitude = $coords['longitude'];
                    $store->save();
                }
                $updated++;
            } else {
                $failed++;
                $this->newLine();
                $reason = $geocoder->getLastError();
                $this->warn("  Could not geocode: [{$store->id}] {$store->name}" . ($reason ? " — {$reason}" : ''));
            }
            $bar->advance();
            sleep(1); // Nominatim usage policy: 1 request per second
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Done. Updated: {$updated}, Failed: {$failed}" . ($dryRun ? ' (no changes saved)' : '.'));

        return self::SUCCESS;
    }
}
