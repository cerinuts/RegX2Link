import { IPattern, Settings } from '../settings/Settings';

export class IssueIterator {

    private readonly text: string;
    private readonly issuePatterns: IPattern[];
    private readonly maxSearchAttempts: number;
    private searchAttemptsCount: number = 0;

    constructor(text: string, issuePatterns: IPattern[], maxSearchAttempts = 25) {
        this.text = text;
        this.issuePatterns = issuePatterns;
        this.maxSearchAttempts = maxSearchAttempts;
    }

    public [Symbol.iterator]() {
        return this;
    }

    public next() {
        this.searchAttemptsCount++
        for (const pattern of this.issuePatterns){
            this.searchAttemptsCount++
            if (this.searchAttemptsCount++ > this.maxSearchAttempts) {
                break;
            }
            
            const matchResult = pattern.searchPattern.exec(this.text);
            if (!matchResult) {
                continue;
            }

            const searchMatch = matchResult[1];
            if(searchMatch){
                const issueMatch = pattern.issuePattern.exec(this.text);
                if (!issueMatch)
                {
                    continue;
                }
                const issue = issueMatch[1];
                if (issue) {
                    return { value: { searchPatternMatch: searchMatch, index: matchResult.index, issuePatternMatch: issue, link: pattern.link  }, done: false };
                }
            }
        }
        return { value: undefined, done: true };
    }
}
