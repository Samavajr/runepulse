package com.osrstelemetry.telemetry;

import com.osrstelemetry.telemetry.model.BaselineSnapshot;
import com.osrstelemetry.telemetry.model.XpSnapshot;
import java.time.Instant;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.Map;
import javax.inject.Inject;
import net.runelite.api.Client;
import net.runelite.api.GameState;
import net.runelite.api.Skill;

public class TelemetryService
{
    private final Map<Skill, Integer> lastXp = new EnumMap<>(Skill.class);
    private final Map<Skill, Integer> buffer = new EnumMap<>(Skill.class);
    private Instant lastSend = Instant.EPOCH;
    private boolean baselineSent = false;

    @Inject
    private TelemetryUploader uploader;

    @Inject
    private TelemetryConfig config;

    public void recordXpChange(Skill skill, int currentXp)
    {
        int previous = lastXp.getOrDefault(skill, currentXp);
        int delta = currentXp - previous;

        if (delta > 0)
        {
            buffer.merge(skill, delta, Integer::sum);
        }

        lastXp.put(skill, currentXp);
    }

    public void tick(Client client)
    {
        if (client.getGameState() != GameState.LOGGED_IN)
        {
            return;
        }

        if (client.getLocalPlayer() == null)
        {
            return;
        }

        if (!baselineSent)
        {
            sendBaseline(client);
            baselineSent = true;
        }

        int intervalSeconds = Math.max(15, config.sendIntervalSeconds());
        if (Instant.now().isBefore(lastSend.plusSeconds(intervalSeconds)))
        {
            return;
        }

        if (buffer.isEmpty())
        {
            return;
        }

        String username = client.getLocalPlayer().getName();
        if (username == null || username.isBlank())
        {
            return;
        }

        Map<String, Integer> xpGained = new HashMap<>();
        for (Map.Entry<Skill, Integer> entry : buffer.entrySet())
        {
            xpGained.put(entry.getKey().getName(), entry.getValue());
        }

        uploader.send(new XpSnapshot(
            username,
            Instant.now().getEpochSecond(),
            xpGained
        ));

        buffer.clear();
        lastSend = Instant.now();
    }

    public void reset()
    {
        buffer.clear();
        lastXp.clear();
        lastSend = Instant.EPOCH;
        baselineSent = false;
    }

    private void sendBaseline(Client client)
    {
        String username = client.getLocalPlayer().getName();
        if (username == null || username.isBlank())
        {
            return;
        }

        Map<String, Integer> skills = new HashMap<>();
        for (Skill skill : Skill.values())
        {
            skills.put(skill.getName(), client.getSkillExperience(skill));
        }

        uploader.sendBaseline(new BaselineSnapshot(
            username,
            Instant.now().getEpochSecond(),
            skills
        ));
    }
}
