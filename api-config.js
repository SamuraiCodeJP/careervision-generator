/**
 * キャリア支援ツール 共通APIハンドラー
 * 設計書に基づいたプロンプト生成とGemini API連携を担当
 */

const GeminiAPI = {
    // ★重要: GitHubにキーを公開したくない場合は空欄にし、
    // 実行時にユーザーに prompt で入力させる運用も可能です。
    // もし書き込む場合は、必ず Google Cloud 側でドメイン制限をかけてください。
    apiKey: "YOUR_API_KEY_HERE", 

    async generateContent(promptText) {
        if (!this.apiKey || this.apiKey === "YOUR_API_KEY_HERE") {
            const userKey = prompt("APIキーが設定されていません。キーを入力してください。");
            if (!userKey) return null;
            this.apiKey = userKey;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
        
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }]
                })
            });

            if (!response.ok) throw new Error("API通信エラーが発生しました。");

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Gemini Error:", error);
            return "エラー: 文章を生成できませんでした。";
        }
    },

    // 自己PR用プロンプト生成（設計書 第2章 ルール適用）
    buildPRPrompt(data) {
        return `
あなたは優秀なキャリアコンサルタントとして、大学生の自己PRを作成してください。
【入力データ】
- タイトル: ${data.title}
- 13項目の内容: ${JSON.stringify(data.fields)}

【作成ルール】
1. 文章は「です、ます」調とする。
2. 結論先行（例：私の最大の壁は…です）で書く。
3. 一人称（私）を無駄に多用しない。
4. 解決・克服に向けての行動を具体的に紹介する。
5. 問題克服までのプロセスにおける苦労した心情を、入力内容から類推して人柄が伝わるよう加える。
6. 他者からの褒め言葉があれば、客観的評価としてエピソードに盛り込む。
7. 情報が不足している部分は、自然な範囲でAIが類推しストーリーを補完する。
8. 最後は、得た学びや成長で締めくくる。
9. 文字数は400文字程度とする。
`;
    }
};
