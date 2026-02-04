package com.osrstelemetry.telemetry;

import com.google.gson.Gson;
import com.osrstelemetry.telemetry.model.BaselineSnapshot;
import com.osrstelemetry.telemetry.model.XpSnapshot;
import java.io.IOException;
import javax.inject.Inject;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class TelemetryUploader
{
    private static final MediaType JSON = MediaType.parse("application/json");

    @Inject
    private OkHttpClient httpClient;

    @Inject
    private Gson gson;

    @Inject
    private TelemetryConfig config;

    public void send(XpSnapshot snapshot)
    {
        postJson(buildUrl("/ingest/xp"), gson.toJson(snapshot));
    }

    public void sendBaseline(BaselineSnapshot snapshot)
    {
        postJson(buildUrl("/ingest/baseline"), gson.toJson(snapshot));
    }

    private String buildUrl(String path)
    {
        String base = config.apiBaseUrl();
        if (base == null) return null;

        String trimmed = base.trim();
        if (trimmed.endsWith("/"))
        {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }

        return trimmed + path;
    }

    private void postJson(String url, String json)
    {
        if (url == null || url.isBlank())
        {
            return;
        }

        RequestBody body = RequestBody.create(JSON, json);

        Request.Builder builder = new Request.Builder()
            .url(url)
            .post(body);

        String token = config.apiToken();
        if (token != null && !token.isBlank())
        {
            builder.header("Authorization", "Bearer " + token.trim());
        }

        httpClient.newCall(builder.build()).enqueue(new Callback()
        {
            @Override
            public void onFailure(Call call, IOException e)
            {
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException
            {
                response.close();
            }
        });
    }
}
