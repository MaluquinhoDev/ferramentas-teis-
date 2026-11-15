package com.maluquinhodev.quadra;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.provider.DocumentsContract;
import android.provider.DocumentsContract.Document;
import android.util.Base64;

import com.getcapacitor.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;

@CapacitorPlugin(name = "QuadraStorage")
public class QuadraStoragePlugin extends Plugin {
    private static final String PREFS = "quadra_export";
    private static final String TREE = "tree_uri";
    private static final String FOLDER = "folder_uri";

    @PluginMethod
    public void chooseDirectory(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION
                | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        startActivityForResult(call, intent, "directoryPicked");
    }

    @ActivityCallback
    private void directoryPicked(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null
                || result.getData().getData() == null) {
            call.reject("Seleção de pasta cancelada.");
            return;
        }
        Uri uri = result.getData().getData();
        int flags = result.getData().getFlags()
                & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        try {
            getContext().getContentResolver().takePersistableUriPermission(uri, flags);
            getContext().getSharedPreferences(PREFS, 0).edit()
                    .putString(TREE, uri.toString()).remove(FOLDER).apply();
            call.resolve(new JSObject().put("selected", true));
        } catch (Exception e) {
            call.reject("Não foi possível guardar a permissão da pasta.", e);
        }
    }

    @PluginMethod
    public void createProjectFolder(PluginCall call) {
        try {
            String name = call.getString("name", "Quadra");
            Uri tree = savedTree();
            Uri root = DocumentsContract.buildDocumentUriUsingTree(
                    tree, DocumentsContract.getTreeDocumentId(tree));
            Uri folder = findChild(root, name, true);
            if (folder == null) {
                folder = DocumentsContract.createDocument(
                        getContext().getContentResolver(), root, Document.MIME_TYPE_DIR, name);
            }
            if (folder == null) throw new Exception("O provedor não criou a pasta.");
            getContext().getSharedPreferences(PREFS, 0).edit()
                    .putString(FOLDER, folder.toString()).apply();
            call.resolve(new JSObject().put("folderCreated", true));
        } catch (Exception e) {
            call.reject("Falha ao criar a pasta do projeto: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void writePage(PluginCall call) {
        try {
            String name = call.getString("name");
            String mime = call.getString("mimeType", "image/png");
            String encoded = call.getString("dataBase64");
            if (name == null || encoded == null) throw new Exception("Dados da página incompletos.");
            Uri folder = savedFolder();
            Uri previous = findChild(folder, name, false);
            if (previous != null) {
                DocumentsContract.deleteDocument(getContext().getContentResolver(), previous);
            }
            Uri file = DocumentsContract.createDocument(
                    getContext().getContentResolver(), folder, mime, name);
            if (file == null) throw new Exception("Não foi possível criar " + name);
            byte[] bytes = Base64.decode(encoded, Base64.DEFAULT);
            try (OutputStream out = getContext().getContentResolver().openOutputStream(file, "w")) {
                if (out == null) throw new Exception("Não foi possível abrir " + name);
                out.write(bytes);
                out.flush();
            }
            call.resolve(new JSObject().put("saved", true).put("bytes", bytes.length));
        } catch (Exception e) {
            call.reject("Falha ao gravar página: " + e.getMessage(), e);
        }
    }

    private Uri savedTree() throws Exception {
        String value = getContext().getSharedPreferences(PREFS, 0).getString(TREE, null);
        if (value == null) throw new Exception("Escolha a pasta de destino antes de exportar.");
        return Uri.parse(value);
    }

    private Uri savedFolder() throws Exception {
        String value = getContext().getSharedPreferences(PREFS, 0).getString(FOLDER, null);
        if (value == null) throw new Exception("Crie a pasta do projeto antes de gravar páginas.");
        return Uri.parse(value);
    }

    private Uri findChild(Uri parent, String name, boolean directory) {
        Uri children = DocumentsContract.buildChildDocumentsUriUsingTree(
                parent, DocumentsContract.getDocumentId(parent));
        String[] projection = {
                Document.COLUMN_DOCUMENT_ID,
                Document.COLUMN_DISPLAY_NAME,
                Document.COLUMN_MIME_TYPE
        };
        try (Cursor cursor = getContext().getContentResolver().query(
                children, projection, null, null, null)) {
            if (cursor != null) {
                while (cursor.moveToNext()) {
                    String childName = cursor.getString(1);
                    String childMime = cursor.getString(2);
                    if (name.equals(childName)
                            && (directory == Document.MIME_TYPE_DIR.equals(childMime))) {
                        return DocumentsContract.buildDocumentUriUsingTree(parent, cursor.getString(0));
                    }
                }
            }
        } catch (Exception ignored) {
            // A ausência de acesso/filho é tratada como pasta ou arquivo ainda não existente.
        }
        return null;
    }
}
