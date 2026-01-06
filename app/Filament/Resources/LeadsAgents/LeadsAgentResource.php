<?php

namespace App\Filament\Resources\LeadsAgents;

use App\Filament\Resources\LeadsAgents\Pages\CreateLeadsAgent;
use App\Filament\Resources\LeadsAgents\Pages\EditLeadsAgent;
use App\Filament\Resources\LeadsAgents\Pages\ListLeadsAgents;
use App\Filament\Resources\LeadsAgents\Schemas\LeadsAgentForm;
use App\Filament\Resources\LeadsAgents\Tables\LeadsAgentsTable;
use App\Models\LeadsAgent;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class LeadsAgentResource extends Resource
{
    protected static ?string $model = LeadsAgent::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'LeadsAgent';

    public static function form(Schema $schema): Schema
    {
        return LeadsAgentForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return LeadsAgentsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListLeadsAgents::route('/'),
            'create' => CreateLeadsAgent::route('/create'),
            'edit' => EditLeadsAgent::route('/{record}/edit'),
        ];
    }
}
