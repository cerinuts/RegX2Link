import { Settings } from '../settings/Settings';
import { IssueIterator } from './IssueIterator';

export class TextMessage {

    private readonly settings: Settings;
    private readonly text: string;

    constructor(settings: Settings, text: string) {
        this.text = text;
        this.settings = settings;
    }

    public async hasIssues(): Promise<boolean> {
        // reset all patterns
        for (const pattern of this.settings.patterns){
            pattern.searchPattern.lastIndex = 0;
            pattern.issuePattern.lastIndex = 0;
        }        
        return !this.issueIterator().next().done;
    }

    public async linkIssues(): Promise<string> {
        let text = this.text;
        let offset = 0;

        // reset all patterns
        for (const pattern of this.settings.patterns){
            pattern.searchPattern.lastIndex = 0;
            pattern.issuePattern.lastIndex = 0;
        }

        for (const issue of this.issueIterator()) {
            const lengthBeforeReplacing = text.length;
            const issueIndex = issue!.index;
            const issueLinkText = issue!.searchPatternMatch;
            const issueText = issue!.issuePatternMatch;
            text = textBefore(issueIndex)
                + this.markdownIssueLink(issue!.link, issueLinkText, issueText)
                + textAfter(issueIndex + issueLinkText.length);
            offset += text.length - lengthBeforeReplacing;
        }
        return text;

        function textBefore(index: number) {
            return text.substr(0, offset + index);
        }

        function textAfter(index: number) {
            return text.substr(offset + index);
        }
    }

    private issueIterator() {
        return new IssueIterator(
            this.text,
            this.settings.patterns,
            this.settings.maxSearchAttempts);
    }

    private markdownIssueLink(baseurl, linktext, issueText: string) {
        return `[${linktext}](${baseurl.replace(/%ISSUE%/g, issueText)})`;
    }
}
