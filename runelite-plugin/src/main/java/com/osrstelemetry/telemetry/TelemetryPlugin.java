package com.osrstelemetry.telemetry;

import com.google.inject.Provides;
import javax.inject.Inject;
import net.runelite.api.Client;
import net.runelite.api.GameState;
import net.runelite.api.events.GameTick;
import net.runelite.api.events.StatChanged;
import net.runelite.client.config.ConfigManager;
import net.runelite.client.eventbus.Subscribe;
import net.runelite.api.events.GameStateChanged;
import net.runelite.client.plugins.Plugin;
import net.runelite.client.plugins.PluginDescriptor;

@PluginDescriptor(
    name = "OSRS Telemetry",
    description = "Tracks XP changes and sends them to a backend"
)
public class TelemetryPlugin extends Plugin
{
    @Inject
    private Client client;

    @Inject
    private TelemetryService service;

    @Subscribe
    public void onStatChanged(StatChanged event)
    {
        service.recordXpChange(event.getSkill(), event.getXp());
    }

    @Subscribe
    public void onGameTick(GameTick tick)
    {
        service.tick(client);
    }

    @Subscribe
    public void onGameStateChanged(GameStateChanged event)
    {
        if (event.getGameState() != GameState.LOGGED_IN)
        {
            service.reset();
        }
    }

    @Provides
    TelemetryConfig provideConfig(ConfigManager configManager)
    {
        return configManager.getConfig(TelemetryConfig.class);
    }
}
