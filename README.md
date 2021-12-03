# RegX2Link
This is an extension for [RocketChat](https://rocket.chat/). Its purpose is to automagically make specific text (matched by regular expressions) to links, similar to automatic Github Links. It supports multiple configurations.

## Example
For example the following config:
```yaml
github:
    link: "https://github.com/ceriath/regx2link/issues/%ISSUE%"
    searchPattern: "GH:[0-9]+"
    issuePattern: "[0-9]+"
```
makes the following message:
```markdown
This is a text message to github issue GH:#20
```
to:
```markdown
This is a text message to github issue [GH:20](https://github.com/ceriath/regx2link/issues/20)
```
which will then appear as:

This is a text message to github issue [GH:20](https://github.com/ceriath/regx2link/issues/20)

## Configuration
The Pattern Configuration is defined in yaml:
```yaml
# turns "I:issue-1234" to a link to https://example.com/issues/issue-1234
example: 
    link: "https://example.com/issues/%ISSUE%"
    searchPattern: "I:[a-zA-Z]+-[0-9]+"
    issuePattern: "[a-zA-Z]+-[0-9]+"
# turns "GH:20" to a link to https://github.com/ceriath/regx2link/issues/20
github:
    link: "https://github.com/ceriath/regx2link/issues/%ISSUE%"
    searchPattern: "GH:[0-9]+"
    issuePattern: "[0-9]+"
```

`name`: can be anything.  

`link`: is the link, with the `%ISSUE%` placeholder being replaced with the regular expression match to `issuePattern`  

`searchPattern`: This pattern defines what part of a message should be made to a link. Can be the same as the actual `issuePattern`, but can include something else too. However, it must contain the `issuePattern` 

`issuePattern`: This pattern will be matched on the contents matched to the `searchPattern`, this will be included in the actual link.  

# Credits
Most code and the general functionality was created by https://github.com/Zakhar-Petrov/rocketchat-youtrack-linker  
I just took over the code and added a bit more functionality and generalization.

# [LICENSE](./LICENSE)